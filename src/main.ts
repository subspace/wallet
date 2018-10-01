import * as interfaces from './interfaces'


class ModuleName {
  constructor() {

  }
  sync_method() {
    // describe method
    return module_name.some_property
  }

  async async_method() {
    // describe method
    try {
      return module_name.some_property
    }
    catch(error) {
      console.log('An error occcured')
      console.log(error)
    }
  }


}

const module_name = {
  some_property: 'hello subspace',
  
}

module.exports = ModuleName