
export interface IWallet {
  profile: IProfile
  contract: IContract
  init(): Promise<void>
  createProfile(options?: IProfileOptions): Promise<IProfileObject>
  getProfile(): IProfileObject 
  createContract(options: IContractOptions): Promise<IContractObject>
  getContract(): IContractObject
  clear(): Promise<void>
}

export interface IKeyOptions {
  name: string,
  email: string,
  passphrase: string
} 

export interface IKeyChain {
  keys: IKey[]
  save(): Promise<void>
  load(): Promise<void>
  clear(): Promise<void>
  addKey(type: string): Promise<string>
  openKey(id: string, passphrase: string): Promise<IKey>
  removeKey(id: string): void
}

export interface IKey {
  id: string
  type: string
  createdAt: number
  public: string
  private: string
  privateObject: any
}

export interface IProfileOptions extends IKeyOptions {}

export interface IProfile {
  user: {
    id: string
    name: string
    email: string
    passphrase: string
    createdAt: number    
  }
  key: IKey
  create(options?: IProfileOptions): Promise<void>
  save(): Promise<void>
  load(): Promise<void>
  clear(): Promise<void>
}

export interface IProfileObject {
  id: string
  name: string
  email: string
  passphrase: string
  createdAt: number
  publicKey: string
  privateKey: string
  privateKeyObject: any
}

export interface IContractOptions extends IKeyOptions {
  spaceReserved: number
  ttl: number
  replicationFactor: number
}

export interface IContract {
  options: {
    id: string
    name: string
    email: string
    passphrase: string
    ttl: number
    replicationFactor: number
    spaceReserved: number
    createdAt: number
  }
  state: {
    spaceUsed: 0
    updatedAt: number
    recordIndex: Set<string>
  }
  key: IKey
  create(options: IContractOptions): Promise<void>
  save(): Promise<void>
  load(): Promise<void>
  clear(): Promise<void>
  addRecord(id: string, size: number): Promise<void>
  updateRecord(id: string, sizeDelta: number): Promise<void>
  removeRecord(id: string, size: number): Promise<void>
}

export interface IContractObject {
  id: string
  name: string
  email: string
  passphrase: string
  ttl: number
  replicationFactor: number
  spaceReserved: number
  spaceUsed: number
  createdAt: number
  updatedAt: number
  recordIndex: Set<string>
  publicKey: string
  privateKey: string
  privateKeyObject: any
}



