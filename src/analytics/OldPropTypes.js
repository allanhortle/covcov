import Github from '../service/Github';
import {Task, TaskPromise, Resolve} from 'fronads';
import {List} from 'immutable';

export function TaskPromiseAll(fn: Function): Task {
    return new Task((reject, resolve) => Promise.all(fn()).then(resolve, reject));
}

function searchCode(props) {
    return TaskPromise(() => Github.search.code(props))
}

function nextPage(link) {
    return TaskPromise(() => Github.getNextPage(link));
}

function GetContent(file) {
    return TaskPromise(() => Github.repos.getContent(file));
}


function bas64Decode(str) {
    return new Buffer(str + '', 'base64').toString('ascii');
}

function chunk(list, chuckSize) {
    return new Array(Math.ceil(list.length / chuckSize)).fill().map(_ => list.splice(0,chuckSize));
}


export default function OldPropTypes() {
    const input = 'React.propTypes';
    // const input = 'pnut';
    const query = {
        // q: `org:blueflag org:bigdatr org:getjarvis PropTypes`,
        q: `org:blueflag extension:jsx ${input}`,
        per_page: 100
    };

    const result = [];

    function recurseSearch(payload) {``
        const hasNextPage = Github.hasNextPage(payload.meta.link);
        if(!hasNextPage || true) {
            console.log('done');
            return Resolve(payload);
            // return Resolve('done')
        }
        console.log(payload.meta.link.match(/&page=(\d)/)[1] * query.per_page, 'of', payload.data.total_count);
        return nextPage(payload.meta.link)
            .flatMap(recurseSearch)
            .map(nextPayload => {
                nextPayload.data.items = payload.data.items.concat(nextPayload.data.items);
                return nextPayload;
            })
    }

    return searchCode(query)
        .map(payload => console.log(query.per_page, 'of', payload.data.total_count) || payload)
        .flatMap(recurseSearch)
        .map(payload => payload.data.items)
        .flatMap((data) => {
            return chunk(data, 10).reduce((chain, files) => {
                return chain.flatMap(arr => {
                    return TaskPromiseAll(() => files.map(file => {
                        const {repository, path} = file;
                        const {owner, name} = repository;
                        const query = {
                            owner: owner.login,
                            repo: name,
                            path
                        };
                        console.log(`fetching ${name}/${path}`);
                        return GetContent(query).map(ii => arr.concat(ii))
                    }));
                });

            }, Resolve([]))

            // return TaskPromiseAll(() => {
            //     return data.map(ii => {
            //         const {repository, path} = ii;
            //         const {owner, name} = repository;
            //         return Github.repos
            //             .getContent({owner: owner.login, repo: name, path})
            //             // .catch(ii => console.log(ii)))
            //     });
            // });
        })
        // .map(list => list.groupBy(ii => ii.repository.full_name).keySeq())
        .map(data => data
            .filter(ii => bas64Decode(ii.data.content).indexOf(input) !== -1)
            .map(ii => ii.data.html_url)
            .sort()
        )
        .map(data => console.log(data.join('\n')))
        .leftMap(err => console.log(err))
        .run();

}
