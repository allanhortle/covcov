
export const mapNodes = (edgeList, mapper) => edgeList.edges.map(({node}, index) => mapper(node, index));
