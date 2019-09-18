// @flow
import React from 'react';

type Config = {
    name: string
};

export default (config: Config) => (Component: *) => (props: *) => {
    const pos = {top: 1, left: 1};
    return props[config.name]
        .requestState
        .fetchingMap(() => <box {...pos}>Loading...</box>)
        .refetchingMap(() => <box {...pos}>Loading...</box>)
        .successMap(() => <Component {...props} />)
        .errorMap(() => <box {...pos}>Error!</box>)
        .value();
};

