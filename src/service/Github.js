// @flow
import {graphql} from '@octokit/graphql';

export default async (vars: {}, query: string): Promise<mixed> => {
    return graphql(query, {
        ...vars,
        headers: {
            authorization: `token ${process.env.GITHUB_TOKEN || ''}`
        }
    })
        .catch(log);
};

