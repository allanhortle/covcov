// @flow
import React, {useEffect, useState} from 'react';
import LoadingBoundary from '../core/LoadingBoundary';
import Api from '../core/EntityApi';
import get from 'unmutable/lib/get';
import getIn from 'unmutable/lib/getIn';
import map from 'unmutable/lib/map';
import sortBy from 'unmutable/lib/sortBy';
import pipeWith from 'unmutable/lib/util/pipeWith';
import pipe from 'unmutable/lib/util/pipe';
import {blue, red, green, magenta, grey, yellow} from '../util/tag';
import {mapNodes} from '../util/edgeList';
import ListLayout from '../affordance/ListLayout';
import BlockLayout from '../affordance/BlockLayout';
import Title from '../affordance/Title';
import flatMap from 'unmutable/flatMap';


export default function TimelineItemArray(item, left = 0) {
    const bottomPadding = {top: 0, bottom: 1, left: 0, right: 0};
    const {author, createdAt, state, body, comments, __typename, id, diffHunk, outdated, path} = item;
    switch (__typename) {
        case 'PullRequestReview': {
            let color = 'blue';
            if(state === 'APPROVED') color = 'blue';
            if(state === 'CHANGES_REQUESTED') color = 'red';

            return [
                <box key={id} tags content={`{${color}-fg}${author.login} ${state} at ${createdAt}{/}`}/>,
                <box padding={{left, bottom: 1, right: 0, top: 0}} key={id + 'body'}>{body}</box>
            ].concat(mapNodes(comments, item => CommentArray(item, 4)))
        }

        case 'IssueComment':
            return [
                <box padding={{left, bottom: 0, right: 0, top: 0}} key={id} tags content={`${yellow(author.login)} ${grey(createdAt)}`}/>,
                <box padding={{left, bottom: 1, right: 0, top: 0}} key={id + 'body'}>{body}</box>
            ];

        case 'PullRequestReviewComment': {
            let outdatedText = outdated ? grey('OUTDATED') : ''
            let code = diffHunk.split('\n').slice(1).slice(-3).map(line => {
                if(line[0] === '+') return green(line);
                if(line[0] === '-') return red(line);
                return line;
            }).join('\n');
            return [
                <box padding={{left, bottom: 0, right: 0, top: 0}} key={id} tags content={`${yellow(author.login)} ${grey(createdAt)} ${outdatedText}`}/>,
                <box padding={{left, bottom: 0, right: 0, top: 0}} key={id + 'path'} tags content={grey(path)} />,
                <box padding={{left, bottom: 0, right: 0, top: 0}} key={id + 'diff'} tags content={code} width="100%"/>,
                <box padding={{left, bottom: 1, right: 0, top: 0}} key={id + 'body'}>{body}</box>
            ];
        }

        default:
            return [];
    }
}
