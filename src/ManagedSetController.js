/**
 * Copyright 2019 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
        this.log.error(rsp);
        let kind = objectPath.get(rsp, 'body.details.kind') || objectPath.get(resources, [i, 'kind']);
        let group = objectPath.get(rsp, 'body.details.group') || objectPath.get(resources, [i, 'apiVersion']);
        let name = objectPath.get(rsp, 'body.details.name') || objectPath.get(resources, [i, 'metadata', 'name']);
        return Promise.reject(`${kind}.${group} "${name}" status ${rsp.statusCode} ${objectPath.get(rsp, 'body.reason', '')}.. see logs for details`);
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
