import { IWallet, IProfileOptions, IProfile, IProfileObject, IContractOptions, IContract, IContractObject } from './interfaces';
export default class Wallet implements IWallet {
    storage: any;
    constructor(storage: any);
    private keyChain;
    profile: IProfile;
    contract: IContract;
    init(): Promise<void>;
    createProfile(options?: IProfileOptions): Promise<IProfileObject>;
    getProfile(): IProfileObject;
    createContract(options: IContractOptions): Promise<IContractObject>;
    getContract(): IContractObject;
    clear(): Promise<void>;
}
