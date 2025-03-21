declare const _default: {
    info: {};
    /** 动态渲染的组件 */
    components: () => (import("node-karin").InputProps | import("node-karin").DividerProps | import("node-karin").RadioGroupProps | import("node-karin").CheckboxGroupProps | import("node-karin").AccordionProps | import("node-karin").AccordionProProps)[];
    /** 前端点击保存之后调用的方法 */
    save: (config: any) => void;
};
export default _default;
