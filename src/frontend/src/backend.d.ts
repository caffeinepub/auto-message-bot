import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Message {
    text: string;
    sender: string;
    timestamp: Time;
}
export interface Rule {
    response: string;
    keyword: string;
}
export type Time = bigint;
export interface Template {
    content: string;
    name: string;
}
export interface backendInterface {
    createRule(keyword: string, response: string): Promise<void>;
    createTemplate(name: string, content: string): Promise<void>;
    deleteRule(id: bigint): Promise<void>;
    deleteTemplate(id: bigint): Promise<void>;
    getAllMessages(): Promise<Array<Message>>;
    getAllRules(): Promise<Array<Rule>>;
    getAllTemplates(): Promise<Array<Template>>;
    sendMessage(sender: string, text: string): Promise<void>;
    setFallback(response: string): Promise<void>;
    toggleBot(state: boolean): Promise<void>;
    updateRule(id: bigint, keyword: string, response: string): Promise<void>;
    updateTemplate(id: bigint, name: string, content: string): Promise<void>;
}
