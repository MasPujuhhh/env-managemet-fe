# Frontend architecture

```text
View → feature component → typed API service → NestJS API
```

Layouts provide navigation and page context. The auth store owns the current user and token lifecycle. Page data is intentionally local to avoid a complex global cache.
