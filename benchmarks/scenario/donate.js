'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

class DonateWorkload extends WorkloadModuleBase {
    constructor() {
        super();
        this.txIndex = 0;
    }

    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);
    }

    async submitTransaction() {
        this.txIndex++;
        
        // Memanggil fungsi verifyPovertyStatus pada Smart Contract PovertyCheck
        // Mengirimkan parameter dummy (karena kita sudah memakai MockVerifier yang selalu return true)
        const args = {
            contract: 'PovertyCheck',
            verb: 'verifyPovertyStatus',
            args: [
                ['123', '456'],
                [['123', '456'], ['789', '0']],
                ['123', '456'],
                ['1']
            ],
            readOnly: false
        };

        await this.sutAdapter.sendRequests(args);
    }

    async cleanupWorkloadModule() {
        // Tidak ada pembersihan yang diperlukan
    }
}

function createWorkloadModule() {
    return new DonateWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
