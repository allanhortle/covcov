// @flow
import React, {createContext} from 'react';
import composeWith from 'unmutable/lib/util/composeWith';
import pipe from 'unmutable/lib/util/pipe';
import {render} from 'react-blessed';

import CoreStructure from './CoreStructure';
import CoreScreen from './CoreScreen';
import ErrorBoundaryHoc from './ErrorBoundaryHoc';


export default pipe(
    ({files, program}) => composeWith(
        ErrorBoundaryHoc(),
        (Component) => (props) => {
            return <Component
                {...props}
                files={files}
                cwd={process.cwd()}
            />;
        },
        CoreStructure
    ),
    (Structure) => {
        return render(<Structure />, CoreScreen)
    }
);

