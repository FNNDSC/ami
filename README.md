# vjs
the FNNDSC visualization tool (based on XTK and ThreeJS)!

## Usage

### 1. Create
```javascript
myCjs = new cjs.cjs();
```
### 2. Join the party
```javascript
// callback to be called on cjs is ready
myCjs.ready = function(){
  window.console.log("room ready!");
};

// callback to be called on cjs is closed
myCjs.closed = function(){
  window.console.log("room closed!");
};

// join/leave the party
myCjs.join('roomName');
```

### 3. Connect events
A handler is composed of 3 elements:

**name**: the name of the message to be sent/received.

**target**: the object that will emit a message 'name' to be propagated to the room.

**callback**: the function to be executed after the message is received.

With the following approach, we we add/remove viewer from the **scene**, we also add/remove its handlers. This is very flexible.

**!IMPORTANT! We need to keep track of each handler to be able to remove it properly.**

Maybe id can just be the target's ID.

```javascript
myHandler = {
  id: 'myHandlerID',
  name: 'messageName',
  target: 'viewer1Id'
  callback: function(message){
    window.console.log('messageName received! ' + message);
  }
}

// add a handler
myCjs.add(myHandler);

// remove it
myCjs.remove(myHandler);
```
### 4. Data synchronization

1. Somebody creates the room
2. On ready callback, uploads the data to a shared location
3. On uploaded, send a message to everybody in the room so they can grab it.
4. Somebody else joins, sends a message "getData/syncData"
5. Receives a message and knows how to handle it.
