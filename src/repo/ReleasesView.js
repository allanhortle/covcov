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
import ListLayout from '../affordance/ListLayout';
import BlockLayout from '../affordance/BlockLayout';
import Title from '../affordance/Title';
import {Markdown} from 'react-blessed-contrib';


export default (props) => {
    const {name, owner} = props.repo;
    return <ListLayout
        request={Api.repo.releases.useRequest}
        payload={{name, owner}}
        id={get('tagName')}
        list={getIn(['repository', 'releases'])}
        listHead={['Tag', 'Name']}
        renderListItem={ii => [
            ii.tagName,
            ii.name
        ]}
        itemView={PullDescription}
        onSelect={content => {
            const match = content.match(/^(.*?)\s/) || [];
            return match[1];
        }}
    />;
}

function PullDescription({data}) {
    const {tagName, isDraft, name, description = '', author, publishedAt,url} = data;
    const descriptionLines = description.split('\r').length;
    const rowPadding = {top: 1, bottom: 1, left: 0, right: 0};

    return <BlockLayout mouse scrollable scrollbar border="bg">
        <listtable tags align="left" height={5}  rows={[
            ['tag: ', isDraft ? red('DRAFT') : magenta(tagName)],
            ['name: ', name],
            ['opened by: ', yellow(author.login)],
            ['published:', `${publishedAt}`],
            ['url:', `${url}`],
        ]}/>
        <Title margin={rowPadding}>description</Title>
        <Markdown key={description}>{description}</Markdown>
    </BlockLayout>;
}

