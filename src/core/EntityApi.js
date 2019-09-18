// @flow
import {EntityApi} from 'react-enty';
import ApplicationSchema from './ApplicationSchema';
import github from '../service/Github';

const takeFirst = (request) => {
    let current;
    return async (...args) => {
        if(current) {
            return current.then(
                response => {
                    current = null;
                    return response;
                },
                err => {
                    current = null;
                    throw err
                }
            );
        }
        current = request(...args);
        return current;
    }
};

const Api = EntityApi({
    repo: {
        pulls: takeFirst((params) => github(params, `
query ($owner: String!, $name: String!) {
  repository(owner: $owner, name: $name) {
    pullRequests(first: 50, orderBy: {field: UPDATED_AT, direction: DESC}) {
      edges {
        node {
          id
          number
          title
          body
          state
          baseRefName
          headRefName
          createdAt
          updatedAt
          url
          author {
            login
          }
          additions
          deletions
          timelineItems(last: 50, itemTypes: [PULL_REQUEST_REVIEW, ISSUE_COMMENT]) {
            edges {
              node {
                __typename
                ... on PullRequestReview {
                  id
                  state
                  createdAt
                  body
                  author {
                    login
                  }
                  comments(last: 20) {
                    edges {
                      node {
                        id
                        __typename
                        diffHunk
                        outdated
                        path
                        author {
                          login
                        }
                        createdAt
                        body
                      }
                    }
                  }
                }
                ... on IssueComment {
                  id
                  body
                  createdAt
                  author {
                    login
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
        `)),

        issues: takeFirst((params) => github(params, `
query($owner: String!, $name: String!) {
  repository(owner: $owner, name: $name) {
    issues(first: 50, orderBy: {field: CREATED_AT, direction: DESC}) {
      edges {
        node {
          id
          number
          title
          body
          state
          createdAt
          updatedAt
          url
          author {login}
          timelineItems(last: 50, itemTypes: [ISSUE_COMMENT]) {
            edges {
              node {
                __typename
                ... on IssueComment {
                  id
                  body
                  createdAt
                  author {
                    login
                  }
                }
              }
            }
          }
          labels(first: 10) {
            edges {
              node {
                color
                name
              }
            }
          }
        }
      }
    }
  }
}
        `)),

        releases: takeFirst((params) => github(params, `
query($owner: String!, $name: String!) {
  repository(owner: $owner, name: $name) {
    releases(first: 50, orderBy: {field: CREATED_AT, direction: DESC}) {
      edges {
        node {
          id
          createdAt
          updatedAt
          isDraft
        isPrerelease
          url
          author {login}
          tagName
          tag {
            id
          }
          name
          description
          publishedAt
        }
      }
    }
  }
}
        `)),

        readme: takeFirst((params) => github(params, `
query($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
        object(expression: "master:README.md") {
            ... on Blob {
            text
            }
        }
    }
}
        `)),

        repo: takeFirst((params) => github(params, `
query($owner: String!, $name: String!) {
  repository(owner: $owner, name: $name) {
    pullRequests(states:OPEN) {
      totalCount
    }
    issues(states: OPEN) {
      totalCount
    }
    stargazers {
      totalCount
    }
    watchers {
      totalCount
    }
    url
    sshUrl
    description
    homepageUrl
    isArchived
   object(expression: "master:README.md") {
      ... on Blob {
        text
      }
    }
  }
}
        `)),

    }
}, ApplicationSchema);

export default Api;
