type VariantPage<T> = {
  nodes: T[];
  pageInfo: {hasNextPage: boolean; endCursor?: string | null};
};

// Bound catalog reads and reject partial results before resolving a cart selection.
export async function loadJerseyVariants<T extends {id: string}>(
  first: VariantPage<T>,
  readNext: (cursor: string) => Promise<VariantPage<T> | null>,
): Promise<VariantPage<T>> {
  let page = first;
  const nodes = [...first.nodes];
  const cursors = new Set<string>();
  for (let pages = 1; page.pageInfo.hasNextPage; pages++) {
    const cursor = page.pageInfo.endCursor;
    if (pages === 2 || !cursor || cursors.has(cursor)) {
      throw new Error('The jersey catalog could not be loaded completely.');
    }
    cursors.add(cursor);
    const next = await readNext(cursor);
    if (!next) throw new Error('The jersey catalog disappeared while loading.');
    nodes.push(...next.nodes);
    page = next;
  }
  if (new Set(nodes.map(({id}) => id)).size !== nodes.length) {
    throw new Error('The jersey catalog changed while loading. Please retry.');
  }
  return {nodes, pageInfo: page.pageInfo};
}
