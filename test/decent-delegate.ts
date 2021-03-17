import { Client, Provider, ProviderRegistry, Result, unwrapResult } from "@blockstack/clarity";
import { standardPrincipalCV } from "@stacks/transactions";
import { assert } from "chai";

describe("decent delegate contract test suite", () => {
  let decentDelegateClient: Client;
  let poxClient: Client;
  let provider: Provider;

  before(async () => {
    provider = await ProviderRegistry.createProvider([
      {
        amount: 1e18,
        principal: "SP3GWX3NE58KXHESRYE4DYQ1S31PQJTCRXB3PE9SB"
      },
    ]);
    decentDelegateClient = new Client("SP3GWX3NE58KXHESRYE4DYQ1S31PQJTCRXB3PE9SB.decent-delegate", "decent-delegate", provider);
    poxClient = new Client("ST000000000000000000002AMW42H.pox", "pox", provider);
  });

  describe("deploying an instance of the contract", () => {
    before(async () => {
      await poxClient.checkContract();
      await poxClient.deployContract();
      await decentDelegateClient.checkContract();
      await decentDelegateClient.deployContract();
      });
    
    it('should create a pool', async () => {
      const tx = decentDelegateClient.createTransaction({
        method: {
          name: 'create-decent-pool',
          args: [
            "u15000000000",
            "u100000000",
            "u1",
            "u7500000000",
            "u1000",
            "u90000000000000",
            "{hashbytes: 0x83a2c9ebbdedebd6f2c4fde942f1e1141140aeaa, version: 0x00}",
          ]
        },
      })
      // query.sign('421a4472c07e13886eaa9229573140ad5e889f3dd7090ab4ac919e5d84b9dce8')
      tx.sign('SP3GWX3NE58KXHESRYE4DYQ1S31PQJTCRXB3PE9SB')
      const receipt = await decentDelegateClient.submitTransaction(tx);
      const result = Result.unwrap(receipt);

      console.log(result);
    })

    it('should delegate by taking stx from sender', async () => {
      const tx = decentDelegateClient.createTransaction({
        method: {
          name: 'delegate',
          args: [
            "u20000000000000",
            "true",
          ]
        },
      })
      // query.sign('421a4472c07e13886eaa9229573140ad5e889f3dd7090ab4ac919e5d84b9dce8')
      tx.sign('SP3GWX3NE58KXHESRYE4DYQ1S31PQJTCRXB3PE9SB')
      await decentDelegateClient.submitTransaction(tx);
      const receipt = await decentDelegateClient.submitTransaction(tx);
      const result = Result.unwrap(receipt);
      console.log(result);
    })
    
    // it("it should stack", async () => {
    //   const tx = poxClient.createTransaction({
    //     method: {
    //       name: 'stack-stx',
    //       args: [
    //         "u100000000000",
    //         "{hashbytes: 0x83a2c9ebbdedebd6f2c4fde942f1e1141140aeaa, version: 0x00}",
    //         "u1940641",
    //         "u1"
    //       ]
    //     },
    //   })
    //   // query.sign('421a4472c07e13886eaa9229573140ad5e889f3dd7090ab4ac919e5d84b9dce8')
    //   tx.sign('SP3GWX3NE58KXHESRYE4DYQ1S31PQJTCRXB3PE9SB')
    //   const receipt = await poxClient.submitTransaction(tx);
    //   const result = Result.unwrap(receipt);
    //   console.log(result);
    // })

    // it('should ')
  });

  after(async () => {
    await provider.close();
  });
});
