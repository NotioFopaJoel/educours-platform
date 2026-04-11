# API Authentication Documentation - EduCours Platform

## Table of Contents
1. [Overview](#overview)
2. [Base URL](#base-url)
3. [Authentication Methods](#authentication-methods)
4. [Endpoints](#endpoints)
5. [Request/Response Examples](#examples)
6. [Error Codes](#error-codes)
7. [Rate Limiting](#rate-limiting)
8. [Security](#security)
9. [Webhooks](#webhooks)
10. [Troubleshooting](#troubleshooting)

## Overview <a name="overview"></a>

This document describes the authentication API for EduCours Platform. All protected endpoints require a valid JWT token.

## Base URL <a name="base-url"></a>


## Authentication Methods <a name="authentication-methods"></a>

### 1. JWT (JSON Web Token)
```http
Authorization: Bearer <your_jwt_token>

X-API-Key: <your_api_key>


POST /auth/register
Content-Type: application/json

{
    "email": "student@educours.ma",
    "username": "john_student",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+212600000000",
    "role": "student",
    "termsAccepted": true
}