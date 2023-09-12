# async event emitter 异步消息处理器

这是一个功能非常强大的nodejs组件，它可以允许你使用`await`显式的等待一个信号的到达，并方便快速的获取它的参数。

```typescript
const aee = new AsyncEventEmitter()

async function Athread() {
    let value1 = await aee.async_once("test_event", [], 1000)
    // 1000是超时时间，超过1000毫秒的等待将会导致reject。
    // value1 将会是[100, 200]
    value1 = await aee.async_once("test_event", [100])
    // value1 将会是[200]
    value1 = await aee.async_once("test_event")
    // value1 将会是[100, 200]
    value1 = await aee.async_once("test_event", [200])
    // 阻塞，没有消息了。
}

Athread()
aee.emit("test_event", 100, 200)
```

同时，你还可以直接取消一个等待中的Promise，相关的监听器会自动析构，回收内存。