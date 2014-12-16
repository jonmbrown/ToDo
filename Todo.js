//
// Todo.js   - Based on simple-todos
//
// Jon Brown - Nov / Dec 2014
//
// My first Meteor app. It's basically a shopping list
//

// These functions are available on both the client and the server ===========================

var greet = function(name) {
  console.log(name);
}

Tasks = new Mongo.Collection("tasks");

// Everything in here is only run on the server ==============================================

if (Meteor.isServer) {
  Meteor.publish("tasks", function () {
    return Tasks.find();
  });

  greet(">>> SimpleToDos server is alive");

  Meteor.methods({    
    ServerMessage: function(msg){
      greet(msg); // Show message on the server
    } // ServerMessage
  });
} // isServer

// Everything in here is only run on the client ==============================================

if (Meteor.isClient) {
  
  Meteor.subscribe("tasks");

  Session.set("hideCompleted", true); // Default to hiding bought items
        
  Template.body.helpers({
    tasks: function () {
      if (Session.get("hideCompleted")) {
        // If hide completed is checked, filter tasks
        return Tasks.find({checked: {$ne: true}}, {sort: {text: 1}}); // By creation use: return Tasks.find({checked: {$ne: true}}, {sort: {createdAt: -1}});
      } else {
        // Otherwise, return all of the tasks
        return Tasks.find({}, {sort: {text: 1}}); // By creation use: Tasks.find({}, {sort: {createdAt: -1}});
      }
    },
    
    hideCompleted: function () {
      return Session.get("hideCompleted");
    },
    
    incompleteCount: function () {
      items = Tasks.find({checked: {$ne: true}}).count();
      if (items == 1) {
        return items + ' item'; // I hate 1 items!
      } else {
        return items + ' items';        
      }
    }

  });
    
  // Inside the if (Meteor.isClient) block, right after Template.body.helpers:
  Template.body.events({
    "submit .new-task": function (event) {
    // This function is called when the new task form is submitted

      console.log(event); // Record everything from the event - just for learning
      
      var text = event.target.text.value; 
                             
      text = text.toLowerCase(); // Store in lowercase as Mongo cannot do case-insensitive sort!
                                 // displayed result is pretty via CSS: text-transform: capitalize; 
      
      Meteor.call('ServerMessage','Added '+text, 0); // Tell the server console
      
      Tasks.insert({
        text: text,
        createdAt: new Date() // current time
      });
      
      // Clear form
      event.target.text.value = "";

      // Prevent default form submit
      return false;
    },
    
    // Add to Template.body.events
    "change .hide-completed input": function (event) {
      Session.set("hideCompleted", event.target.checked);
    }
  });
  
  Template.task.events({
    "click .toggle-checked": function () {
      // Set the checked property to the opposite of its current value
      Tasks.update(this._id, {$set: {checked: ! this.checked}});
    },
    "click .delete": function () {
      Meteor.call('ServerMessage','Deleted', 0); // Tell the server console
      Tasks.remove(this._id);
    }
  });

} // isClient