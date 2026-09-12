# Frontend security

The JWT is the only persisted client credential. Secret values are never requested by list views, and generated API keys are held only in temporary component state for copying. Do not add secrets to URLs, analytics, logs, Pinia state, local storage, or error messages.
