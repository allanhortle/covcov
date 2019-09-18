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
import TimelineItemArray from '../affordance/TimelineItemArray';


export default (props) => {
    const {viewIndex} = props;
    const {owner, name} = props.repo;

    return <ListLayout
        request={Api.repo.pulls.useRequest}
        payload={{owner, name}}
        id={get('number')}
        list={getIn(['repository', 'pullRequests'])}
        initialValue={item => item.number == viewIndex}
        listHead={['#', 'Status', 'Name']}
        renderListItem={ii => [
            `${ii.number}`,
            colorState(ii.state),
            ii.title
        ]}
        itemView={PullDescription}
    />;
}


function PullDescription({data}) {
    const {
        additions,
        author,
        baseRefName,
        body,
        comments,
        createdAt,
        deletions,
        headRefName,
        number,
        timelineItems,
        state,
        updatedAt,
        url
    } = data;
    const description = body || 'No Description';
    const descriptionLines = description.split('\r').length;
    const rowPadding = {top: 1, bottom: 1, left: 0, right: 0};
    const bottomPadding = {top: 0, bottom: 1, left: 0, right: 0};


    return <BlockLayout mouse scrollable scrollbar border="bg">
        <listtable tags align="left" height={8}  rows={[
            ['changes:', `${green('+' + additions)} ${red('-' + deletions)}`],
            ['number: ', `#${number}`],
            ['state:', colorState(state)],
            ['opened by:', yellow(author.login)],
            ['merge:', `${blue(headRefName)} into ${blue(baseRefName)}`],
            ['url:', `${url}`],
            ['created:', `${createdAt}`],
            ['updated:', `${updatedAt}`],
        ]}/>
        <Title margin={rowPadding}>Description</Title>
        <box>{description}</box>
        <Title margin={rowPadding}>Comments</Title>
        {TimelineItemArray(timelineItems)}
    </BlockLayout>;
}

function colorState(val) {
    switch(val) {
        case 'MERGED':
            return magenta(val);
        case 'CLOSED':
            return red(val);
        case 'OPEN':
            return green(val);
        default:
            return val;
    }
}

