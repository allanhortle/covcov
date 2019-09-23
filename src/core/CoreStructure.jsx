// @flow
import type {Node} from 'react';
import React, {useState, useRef, useEffect} from 'react';
import FileCoverage from '../affordance/FileCoverage';
import map from 'unmutable/map';
import pipeWith from 'unmutable/pipeWith';
import toArray from 'unmutable/toArray';
import flatten from 'unmutable/flatten';
import {red, green, yellow} from '../util/tag';
import screen from './CoreScreen';

type Props = {
    cwd: string,
    files: Array<*>
};

export default function CoreStructure(props: Props) {
    const {files, cwd} = props;
    const [index, setIndex] = useState(null);
    const [file, setFile] = useState(null);

    const color = (val) => {
        if(val === 1) return green;
        if(val >=  .5) return yellow;
        return red;
    }

    useEffect(() => {
        const action = file === null
            ? () => process.exit(0)
            : () => setFile(null)
        ;

        screen.unkey(['escape', 'q']);
        screen.key(['escape', 'q'], action);
    }, [file]);

    const coverage = pipeWith(
        files.reduce((rr, ii) => ({...rr, ...ii}), {}),
        toArray()
    );


    const coverageStats = coverage.map((data) => {
        const s = Object.values(data.s);
        const b = flatten(1)(Object.values(data.b));
        const f = Object.values(data.f);

        const print = (data) => {
            const coverage = data.filter(_ => _ > 0).length;
            const total = data.length;
            let count = (coverage / total) || 0;
            if(coverage === 0 && total === 0) {
                count = 1;
            }
            const percentage = Math.round(count * 100) + '%';
            const spacer = ' '.repeat(4 - percentage.length);

            return [count, color(count)(`${percentage}${spacer} (${coverage}/${total})`)];
        };

        const [sCount, sText] = print(s);
        const [bCount, bText] = print(b);
        const [fCount, fText] = print(f);
        const averageCount = (sCount + bCount + fCount) / 3;

        return [
            color(averageCount)(data.path.replace(cwd, '')),
            sText,
            bText,
            fText,
        ];
    });

    const [path, statements, branches, functions] = coverageStats[file -1] || [];
    const title = (file === null)
        ? `Coverage: ${cwd}`
        : [
            statements.replace(/ /g, '').replace('fg}', 'bg}Statements '),
            branches.replace(/ /g, '').replace('fg}', 'bg}Branches '),
            functions.replace(/ /g, '').replace('fg}', 'bg}Functions '),
        ].join('  ')
    ;

    const canFit = screen.width >= 144;
    const isOpen = file != null;

    const sizeProps = isOpen
        ? canFit
            ? {width: '40%', height: '100%'}
            : {height: '40%', width: '100%'}
        : {height: '100%', width: '100%'}
    ;


    return <box>
        <box height="100%-1">
            <listtable
                {...sizeProps}
                align="left"
                pad={1}
                mouse={true}
                keys={true}
                focused={true}
                vi={true}
                tags={true}
                invertSelected={true}
                noCellBorders={true}
                style={{
                    selected: {
                        fg: 'black',
                        bg: 'white'
                    }
                }}
                shrink={true}
                selected={index}
                onSelect={(data, index) => {
                    setIndex(index);
                    setFile(index);
                }}
                rows={pipeWith(
                    coverageStats,
                    _ => [['File', 'Statements', 'Branches', 'Functions']].concat(_)
                )}
            />
            {isOpen && <FileCoverage canFit={canFit} data={coverage[file - 1]} />}
        </box>
        <box bottom={0} height={1} tags style={{bg: 'white', fg: 'black'}} content={title} />
    </box>;
}

            //border={{type: 'line', left: true, top: false, right: false, bottom: false}}


