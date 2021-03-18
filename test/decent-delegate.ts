import { Client, NativeClarityBinProvider, Provider, ProviderRegistry, Result, unwrapResult } from "@blockstack/clarity";
import { getDefaultBinaryFilePath } from "@blockstack/clarity-native-bin";
import { standardPrincipalCV } from "@stacks/transactions";
import { assert, expect } from "chai";
import {
  getTempFilePath
} from "@blockstack/clarity/lib/utils/fsUtil";

import {DDXClient} from './ddx-client'

describe("decent delegate contract test suite", () => {
  let decentDelegateClient: Client;
  let poxClient: Client;
  let provider: NativeClarityBinProvider;

  before(async () => {
    provider = await NativeClarityBinProvider.create([
      {
        amount: 1e18,
        principal: "SP3GWX3NE58KXHESRYE4DYQ1S31PQJTCRXB3PE9SB"
      },
    ], getTempFilePath(), getDefaultBinaryFilePath());

    decentDelegateClient = new DDXClient(provider);
    poxClient = new Client("ST000000000000000000002AMW42H.pox", "pox", provider);
  });

  describe("deploying an instance of the contract", () => {
    before(async () => {
      await poxClient.checkContract();
      await poxClient.deployContract();
      await decentDelegateClient.checkContract();
      const result = await decentDelegateClient.deployContract();
      console.log({deploy: Result.unwrap(result)})
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
            "u" + 90e12,
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
            "u" + 100e6,
            "true",
          ]
        },
      })
      // query.sign('421a4472c07e13886eaa9229573140ad5e889f3dd7090ab4ac919e5d84b9dce8')
      tx.sign('SP3GWX3NE58KXHESRYE4DYQ1S31PQJTCRXB3PE9SB')
      await decentDelegateClient.submitTransaction(tx);
      const receipt = await decentDelegateClient.submitTransaction(tx);
      const result = Result.extract(receipt);
      expect(result.success).equal(true)
    })

    it("should reject stacking requests lower than the minimum", async () => {
      const tx = decentDelegateClient.createTransaction({
        method: {
          name: 'delegate',
          args: [
            "u100",
            "false"
          ]
        }
      });
      tx.sign('SP3GWX3NE58KXHESRYE4DYQ1S31PQJTCRXB3PE9SB')

      const result = await decentDelegateClient.submitTransaction(tx);

      expect(Result.extract(result).success).equal(false, "Minimum required");
    })

    it("should stack once it reaches goal", async () => {
      const tx = decentDelegateClient.createTransaction({
        method: {
          name: 'delegate',
          args: [
            "u" + 100e12,
            "false"
          ]
        }
      });
      tx.sign('SP3GWX3NE58KXHESRYE4DYQ1S31PQJTCRXB3PE9SB')

      const result = await decentDelegateClient.submitTransaction(tx);

      console.log(Result.unwrap(result))
      expect(Result.extract(result).success).equal(true, "Stacked");
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
