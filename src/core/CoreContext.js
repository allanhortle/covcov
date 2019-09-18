import {createContext, useContext} from 'react';

const CoreContext = createContext({
    view: '',
    repo: {}
});
export default CoreContext;
export const useCoreContext = () => useContext(CoreContext);
