const objectPath = require('object-path');

const { CompositeController } = require('@razee/kapitan-core');


module.exports = class ManagedSetController extends CompositeController {
  constructor(params) {
    params.finalizerString = params.finalizerString || 'children.managedsets.kapitan.razee.io';
    super(params);
  }

  async added() {
    let resources = objectPath.get(this.data, ['object', 'spec', 'resources'], []);
    for (var i = 0; i < resources.length; i++) {
      let rsp = await this.applyChild(resources[i]);
      if (!rsp.statusCode || rsp.statusCode < 200 || rsp.statusCode >= 300) {
        return Promise.reject(`${resources[i].apiVersion}/${resources[i].kind} status ${JSON.stringify(rsp.body)}`);
      }
    }
    await this.reconcileChildren();
  }

  async finalizerCleanup() {
    // if cleanup fails, do not return successful response => Promise.reject(err) or throw Error(err)
    let res = await super.finalizerCleanup();
    return res;
  }

};
