import axios from "axios";
import get from "lodash/get";
import ualConfig from "../../../config/ual";
import {
  delay,
  PromiseAllSettledFilterFulfilled,
} from "../promise";

type TEndpoint = typeof ualConfig["chain"]["rpcEndpoints"][0];

export const endpointToUrl = (endpoint: TEndpoint) =>
  `${endpoint.protocol}://${endpoint.host}:${endpoint.port}`;

async function post(
  url: string,
  data: { [key: string]: any },
  timeoutMs = 60000
): Promise<any> {
  const response = await axios.post(url, data, {
    timeout: timeoutMs,
  });
  if (
    response.status !== 200 ||
    !(response.headers["content-type"] as string).startsWith("application/json")
  ) {
    throw new Error("Malformed response");
  }
  return response.data;
}

type TEndpointCheck = {
  endpoint: TEndpoint;
  latency: number;
};
async function check(
  endpoint: TEndpoint,
  options: getApiEndpointsOptions
): Promise<TEndpointCheck> {
  const startTime = Date.now();
  const endpointBaseUrl = endpointToUrl(endpoint);
  const response = await post(`${endpointBaseUrl}/v1/chain/get_info`, {});

  if (response.chain_id !== ualConfig.chain.chainId)
    throw new Error(`Invalid chain_id`);
  const timeDiff =
    new Date().getTime() - new Date(`${response.head_block_time}Z`).getTime();
  if (timeDiff > options.maxMsBehindHead) {
    throw new Error(
      `API too far behind head ${endpointBaseUrl}: ${response.head_block_time} (${timeDiff}ms)`
    );
  }

  try {
    await post(`${endpointBaseUrl}/v1/chain/push_transaction`, {});
    throw new Error(`should not be accepted`);
  } catch (transactionError) {
    const eosErrorWhat = get(transactionError, `response.data.error.what`);

    // if it shows correct error, don't rethrow
    if (!/Invalid packed transaction/i.test(eosErrorWhat)) {
      throw transactionError;
    }
  }
  const endTime = Date.now();
  const latency = Math.round((endTime - startTime) / 3);

  return {
    endpoint,
    latency,
  };
}

async function validateBpEndpointsTimed(
  endpoints: TEndpoint[],
  options: getApiEndpointsOptions
) {
  const endpointsBenchmarked = await PromiseAllSettledFilterFulfilled<
    TEndpointCheck
  >(
    endpoints.map(
      (endpoint) =>
        Promise.race([
          check(endpoint, options),
          delay(options.timeoutMs, true),
        ]) as ReturnType<typeof check>
    )
  );

  return endpointsBenchmarked;
}

type getApiEndpointsOptions = {
  timeoutMs: number;
  maxLatencyMs: number;
  maxMsBehindHead: number;
};

export async function sortValidEndpoints(
  endpoints: TEndpoint[],
  options: Partial<getApiEndpointsOptions> = {}
): Promise<TEndpointCheck[]> {
  const mergedOptions = {
    timeoutMs: 10 * 1000,
    maxLatencyMs: Infinity, // no cut off
    maxMsBehindHead: 2 * 1000,
    ...options,
  };
  let validEndpoints = await validateBpEndpointsTimed(endpoints, mergedOptions);

  validEndpoints = validEndpoints.sort((x, y) => x.latency - y.latency);
  if (typeof options.maxLatencyMs === `number`) {
    validEndpoints = validEndpoints.filter(
      (x) => x.latency <= options.maxLatencyMs!
    );
  }

  return validEndpoints;
}
