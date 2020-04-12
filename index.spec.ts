import { GenericContainer, StartedTestContainer } from "testcontainers";
import { Etcd3 as ETCD } from "etcd3";

let container: StartedTestContainer;
let client: ETCD;

beforeAll(async () => {
  container = await new GenericContainer("bitnami/etcd", "3")
    .withEnv("ALLOW_NONE_AUTHENTICATION", "yes")
    .withExposedPorts(2379, 2380)
    .withNetworkMode("bridge")
    .start();

  const [host, port] = [
    container.getContainerIpAddress(),
    container.getMappedPort(2379),
  ];

  client = new ETCD({
    hosts: `http://${host}:${port}`,
  });

  await client.put("service-url-dev").value("http://localhost:8080");
});

afterAll(async () => {
  await client.delete().key("service-url-dev");
  client.close();
  await container.stop();
});

test("Reading HTTP service URL", async () => {
  const url = await client.get("service-url-dev");

  expect(url).toStrictEqual("http://localhost:8080");
});
