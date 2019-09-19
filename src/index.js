#!/usr/bin/env node
import pkg from '../package.json';
import program from 'commander';
import CoreView from './core/CoreView';
import path from 'path';
import fg from 'fast-glob';
import fs from 'fs-extra';
import pipeWith from 'unmutable/pipeWith';
import map from 'unmutable/map';

program
    .version(pkg.version)
    .action(async (program) => {
        const files = pipeWith(
            fg.sync(['**/coverage-final.json'], { ignore: ['**/node_modules/**'] }),
            map(file => fs.readJSONSync(file))
        );

        CoreView({files, program});
    });


program.parse(process.argv);



