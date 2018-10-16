import * as interfaces from './interfaces';
export default class Wallet implements interfaces.IWallet {
    storage: any;
    constructor(storage: any);
    private keyChain;
    profile: interfaces.IProfile;
    contract: interfaces.IContract;
    init(): Promise<void>;
    createProfile(options?: interfaces.IProfileOptions): Promise<interfaces.IProfileObject>;
    getProfile(): interfaces.IProfileObject;
    createContract(options: interfaces.IContractOptions): Promise<interfaces.IContractObject>;
    getContract(): interfaces.IContractObject;
    clear(): Promise<void>;
}
