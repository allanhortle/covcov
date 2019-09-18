// @flow
import React from 'react';
import fs from 'fs-extra';
import pipeWith from 'unmutable/pipeWith';
import map from 'unmutable/map';
import flatMap from 'unmutable/flatMap';
import sortBy from 'unmutable/sortBy';
import groupBy from 'unmutable/groupBy';
import get from 'unmutable/get';
import interleave from 'unmutable/interleave';
import {red, green} from '../util/tag';
import screen from '../core/CoreScreen';


function splitby(indexes) {
    return (str) => indexes
        .concat(str.length)
        .map((ii, key) => {
            if(key === 0) return str.slice(0, ii);
            return str.slice(indexes[key - 1], ii);
        });
}


function normalizeLocation(location: CodeLocation): CodeLocation {
    let {start} = location;
    let end = location.end.line == null ? start : location.end;

    // same line range out of order
    if(start.line === end.line) {
        return {
            start: {line: start.line, column: Math.min(start.column, end.column)},
            end: {line: end.line, column: Math.max(start.column, end.column)}
        }
    }
    // lines are out of order
    if(end.line < start.line) {
        return {start: end, end: start};
    }

    // probably fine
    return {start, end};
}

type Lines = {
    text: string,
    callCount: number,
    uncovered: Array<{type: 'start'|'end', column: number}>
}[];

type CodeLocation = {
    start: {line: number, column: number},
    end: {line: number, column: number}
};

type BranchCoverage = {
    type: string,
    loc: CodeLocation,
    locations: Array<CodeLocation>
};
type FunctionCoverage = {
    name: string,
    decl: CodeLocation,
    loc: CodeLocation
};

type CoverageData = {
    path: string,
    hash: string,
    statementMap: {[string]: CodeLocation},
    fnMap: {[string]: FunctionCoverage},
    branchMap: {[string]: BranchCoverage},
    s: {[string]: number},
    f: {[string]: number},
    b: {[string]: Array<number>}
};

type Props = {
    data: CoverageData
};

export default function FileCoverage({data}: Props) {
    const text = fs.readFileSync(data.path, 'utf8');



    let lines: Lines = [{text: '', callCount: 0, uncovered: []}]
        .concat(text.split('\n').map(line => ({
            text: line,
            callCount: 0
        })));


    let uncovered = [];


    for(var key in data.statementMap) {
        const value = data.statementMap[key];
        const startLine = value.start.line;
        lines[startLine].callCount += data.s[key];
    }



    for(var key in data.fnMap) {
        const value = data.fnMap[key];
        const calls = data.f[key];

        if(calls === 0) {
            const {start,end} = normalizeLocation(value.loc);
            uncovered.push({type: 'start', ...start});
            uncovered.push({type: 'end', ...end});
        }
    }

    for(var key in data.branchMap) {
        const value = data.branchMap[key];
        const {locations} = value;
        const calls = data.b[key];
        value.locations.forEach((location, index) => {
            if(calls[index] === 0) {
                const {start,end} = normalizeLocation(location);
                uncovered.push({type: 'start', ...start});
                uncovered.push({type: 'end', ...end});
            }
        });
    }

    const mostCalls = Math.max(...lines.map(get('callCount')));
    const linesWidth = Math.max(
        String(lines.length).length,
        String(mostCalls).length + 1
    );

    // keep track of the depth of nesting
    let depth = 0;

    const uncoveredMap = pipeWith(
        uncovered,
        sortBy(get('line')),
        flatMap(ii => {
            let value;
            // if starting increase depth then store value
            // if ending store value then decrease depth
            if(ii.type === 'start') {
                depth++;
                value = [depth, ii];
            } else {
                value = [depth, ii];
                depth--;
            }

            // filter out values deeper than root level
            return (value[0] === 1)
                ? [value[1]]
                : []
            ;
        }),
        groupBy(get('line'))
    );

    const highlightedText = pipeWith(
        lines,
        map((ll, index) => {
            const num = ll.callCount || 0;
            let {text} = ll;
            const uncovered = uncoveredMap[index];
            if(uncovered) {
                text = pipeWith(
                    text,
                    splitby(uncovered.map(get('column'))),
                    interleave(uncovered
                        .map(_ => _.type === 'start' ? '{red-fg}' : '{/}')
                        .concat('') // interleave trims the last item if odd. this keeps it in place
                    ),
                    _ => _.join('')
                );
            }

            const chars = num ? `${num}x` : `${index}`;
            const high = Math.max(linesWidth, chars.length);
            const low = Math.min(linesWidth, chars.length);

            return [
                //' ',
                //' '.repeat(high - low),
                num ? `{green-fg}${num}x{/}` : String(index),
                //' │ ',
                text
            ];
        }),
        _ => _.slice(1)
    );
    const longestLine = Math.max(...highlightedText.map(_ => _.length));

    const canFit = false && screen.width >= 144;
        //<box tags width={callsWidth} left={callsOffset} content={highlightedText.map(get(1)).join('\n')} />
    return <table
        tags
        mouse
        scrollable
        border={{type: 'line', left: true, top: false, bottom: false, right: false}}
        width={canFit ? '60%': '100%'}
        left={canFit ? '40%' : '0'}
        bottom={-1}
        top={-1}
        noCellBorders={true}
        fillCellBorders={false}
        pad={0}
        align="left"
        rows={highlightedText}
    />;
}
