import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Map "mo:core/Map";

actor {
  type Message = {
    sender : Text;
    text : Text;
    timestamp : Time.Time;
  };

  module Message {
    public func compare(message1 : Message, message2 : Message) : Order.Order {
      Int.compare(message1.timestamp, message2.timestamp);
    };
  };

  type Rule = {
    keyword : Text;
    response : Text;
  };

  module Rule {
    public func compare(rule1 : Rule, rule2 : Rule) : Order.Order {
      Text.compare(rule1.keyword, rule2.keyword);
    };
  };

  type Template = {
    name : Text;
    content : Text;
  };

  module Template {
    public func compare(template1 : Template, template2 : Template) : Order.Order {
      Text.compare(template1.name, template2.name);
    };
  };

  var botEnabled = true;
  var defaultFallback = "I didn't understand that.";
  var nextRuleId = 0;
  var nextTemplateId = 0;

  let conversation = Map.empty<Int, Message>();
  let rules = Map.empty<Int, Rule>();
  let templates = Map.empty<Int, Template>();

  // Toggle Bot
  public shared ({ caller }) func toggleBot(state : Bool) : async () {
    botEnabled := state;
  };

  // Set Fallback Response
  public shared ({ caller }) func setFallback(response : Text) : async () {
    defaultFallback := response;
  };

  // Rule Management
  public shared ({ caller }) func createRule(keyword : Text, response : Text) : async () {
    if (keyword.isEmpty() or response.isEmpty()) {
      Runtime.trap("Keyword and response cannot be empty");
    };
    let rule : Rule = { keyword; response };
    rules.add(nextRuleId, rule);
    nextRuleId += 1;
  };

  public shared ({ caller }) func updateRule(id : Int, keyword : Text, response : Text) : async () {
    switch (rules.get(id)) {
      case (null) { Runtime.trap("Rule does not exist") };
      case (_value) {
        rules.add(id, { keyword; response });
      };
    };
  };

  public shared ({ caller }) func deleteRule(id : Int) : async () {
    switch (rules.get(id)) {
      case (null) { Runtime.trap("Rule does not exist") };
      case (_value) {
        rules.remove(id);
      };
    };
  };

  public query ({ caller }) func getAllRules() : async [Rule] {
    rules.values().toArray().sort();
  };

  // Template Management
  public shared ({ caller }) func createTemplate(name : Text, content : Text) : async () {
    if (name.isEmpty() or content.isEmpty()) {
      Runtime.trap("Name and content cannot be empty");
    };
    let template : Template = { name; content };
    templates.add(nextTemplateId, template);
    nextTemplateId += 1;
  };

  public shared ({ caller }) func updateTemplate(id : Int, name : Text, content : Text) : async () {
    if (name.isEmpty() or content.isEmpty()) {
      Runtime.trap("Name and content cannot be empty");
    };
    switch (templates.get(id)) {
      case (null) { Runtime.trap("Template does not exist") };
      case (_value) {
        templates.add(id, { name; content });
      };
    };
  };

  public shared ({ caller }) func deleteTemplate(id : Int) : async () {
    switch (templates.get(id)) {
      case (null) { Runtime.trap("Template does not exist") };
      case (_value) {
        templates.remove(id);
      };
    };
  };

  public query ({ caller }) func getAllTemplates() : async [Template] {
    templates.values().toArray().sort();
  };

  // Messaging
  public shared ({ caller }) func sendMessage(sender : Text, text : Text) : async () {
    let msg : Message = { sender; text; timestamp = Time.now() };
    conversation.add(conversation.size().toInt(), msg);

    if (botEnabled and sender == "user") {
      await processAutoReply(text);
    };
  };

  func processAutoReply(userText : Text) : async () {
    switch (findMatchingRule(userText)) {
      case (null) {
        let botMessage : Message = {
          sender = "bot";
          text = defaultFallback;
          timestamp = Time.now();
        };
        conversation.add(conversation.size().toInt(), botMessage);
      };
      case (?ruleResponse) {
        let botMessage : Message = {
          sender = "bot";
          text = ruleResponse;
          timestamp = Time.now();
        };
        conversation.add(conversation.size().toInt(), botMessage);
      };
    };
  };

  func findMatchingRule(text : Text) : ?Text {
    for ((_, rule) in rules.entries()) {
      if (text.toLower().contains(#text (rule.keyword.toLower()))) {
        return ?rule.response;
      };
    };
    null;
  };

  // Get All Messages
  public query ({ caller }) func getAllMessages() : async [Message] {
    conversation.values().toArray().sort();
  };
};
