declare const Render: {
    render(path: string, params: {
        scale: any;
        copyright: any;
    }): Promise<import("node-karin").ImageElement>;
    simpleRender(path: string, params: any): Promise<import("node-karin").ImageElement>;
};
export default Render;
