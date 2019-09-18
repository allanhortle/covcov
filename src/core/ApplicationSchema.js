// @flow

import {ObjectSchema} from 'react-enty';
import {EntitySchema} from 'react-enty';
import {ArraySchema} from 'react-enty';

var repo = new EntitySchema('repo');
var repoList = new ArraySchema(repo);

repo.shape = new ObjectSchema({});

export default new ObjectSchema({
    repoList
});
