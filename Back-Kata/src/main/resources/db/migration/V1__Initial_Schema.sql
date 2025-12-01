CREATE TABLE users (
    id UUID PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL
);

CREATE UNIQUE INDEX idx_users_username ON users(username);

CREATE TABLE requests (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    requester_name VARCHAR(255),
    approver_name VARCHAR(255),
    type VARCHAR(255),
    status VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    updated_by VARCHAR(255),
    comments VARCHAR(255)
);

CREATE TABLE request_history (
    id UUID PRIMARY KEY,
    request_id UUID NOT NULL,
    status VARCHAR(255),
    comments VARCHAR(255),
    actor VARCHAR(255),
    timestamp TIMESTAMP,
    CONSTRAINT fk_request_history_request FOREIGN KEY (request_id) REFERENCES requests(id)
);
