export default function setupConnectChain(ctx, chain = []) {
    const { destination } = ctx;
    const [firstNode] = chain;
    chain.forEach((node, i, arr) => {
        if (arr[i + 1]) {
            node.connect(arr[i + 1]);
        } else {
            node.connect(destination);
        }
    })
    return firstNode;
}
