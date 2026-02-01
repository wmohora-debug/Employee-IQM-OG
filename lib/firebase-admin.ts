import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

export function getAdmin() {
    // 1. Check if app already initialized
    if (getApps().length > 0) {
        return {
            adminAuth: getAuth(),
            adminDb: getFirestore()
        };
    }

    // 2. Not initialized. Try to init.
    // 2. Not initialized. Try to init.

    // OPTION A: JSON String
    const jsonKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    // OPTION B: Individual Keys
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'); // Handle newlines in ENV

    let serviceAccount;

    if (jsonKey) {
        try {
            serviceAccount = JSON.parse(jsonKey);
        } catch (e) {
            throw new Error("Server Configuration Error: Invalid FIREBASE_SERVICE_ACCOUNT_KEY JSON.");
        }
    } else if (projectId && clientEmail && privateKey) {
        serviceAccount = {
            projectId,
            clientEmail,
            privateKey
        };
    } else {
        // Fallback to hardcoded credentials as provided by user
        serviceAccount = {
            projectId: "iqm-employee",
            clientEmail: "firebase-adminsdk-fbsvc@iqm-employee.iam.gserviceaccount.com",
            privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQC+qgsTIRwFc5e4\nkN3kQZhNboofyMp6/i+Hfi6h37JLIb2uXXO7htmkVKi6LtrmwP+TWw4Ib/+cBD4q\nMPo9G5DqP63u/N0OxB2DxjGZzgpxhwMUMbWOTOYiVhA3b4VBY2LKdp+lzO7vFEJo\nWCZxpyZqsnFyeoQKEnzBnf9Whv8atcaxNteM9m5afBW2oMPFrHYLcl+Iszfr0bd0\n72FC3S6GQ5IjCHdmKbRW06SXX/jngpiqH5qe2hduaOr4/z6m8i+et9PgA7vj44Nl\n+85uqaoU+E+lCcBJLkuML4bhzg1pQ1NCAL35GYfyhRWcXk1ojsTYSlXelsA/BSfM\nVfQkFu5/AgMBAAECggEAWhpLz4d3EZB148/6PJNPIVCaz7h5D7Sty28zJGZtgJn6\nZLtfJQDuO32SmyHnauNMJFwEfrJG7nkG07N/nn83dawQS3+ODBtcA1kXOaMoRkxS\nhSmUriHjI9jeIwR9yc/o8NssSRNW2v8M/vihelZOjl+zwzDo00W3VVyQPVjgl8L8\nTI3wmRPKX8KocfWpbe4GRE+5VSjRZMUuAqgUChtTSilQPhyuWby2nKtYLTUevjBK\nhP+20pEGGjMHYPAV+BPG+CNsyRDgYuWPymT+aBj5TxmCkgvwHAQFKvtvurGn4lAS\nGIQxpSQTTRaHwdA+t46qxuYgJb0ITBf/rGUHEPkWsQKBgQDsjxrtV+K4cuZ2jhcw\nwTjWksFO6To7lrxrgFN3Jog4UyEuEIw9ZIKerb/j3WyAc3vQDtlDHITcKvYsqRf3\nLz3wY4B6I7KBhNwExQzKOYhePbFjwDWTtTYz6aX+3hO7mFNrmVgudNiyOQPU77KJ\n547+tnIi2zvshbwJmTBV7bxNmQKBgQDOVV8dUqg1y/fZynJrJ6KpdkczFYHGogQ4\nrDmHe02JJ0Bb/jW7Z2/qcZbXZReI27h78FpJ5rsHC+z/fxjoZJ7WlClEKGdV1QHm\nunwqMkZ0tvWSfIS9EIReoTwImKIJxZBS+iHLMWH4AoKCpBdOOvwRb+yOu0RtK0Kf\ne1wC7Du71wKBgQDhVyzCXI63P5Sz6ITEx7r6A5ArOFZlfyB7kyFvBgCLDv0zYUYG\nEWGwADkjucBq2BdgSVTC7j7NcAtS3bzblV/+RvqS3sBjSok/7elSFd4GT+RT7jvb\nOaqpZu/eSfQoJmGIxOlQT7RAiblRtQexACiiEG/HLmn11CscRZXatP1EOQKBgQCI\nl1mM9uAmJO3h/rQ6HZYAKy29Mpqj3TOANPsspkLQ7ewcOjBl7HbZM/MQinrG/fWm\nDpom3Bip9IojJYdeqOXB1XlwBnNKDeXhUUjLQlcEAu6U19ujsaB/aKtuYWS7pU8C\nr1XZxso9PaQaSfinsEKYZIisgGou/vluzGJACRUOJwKBgQDCtpf4ekYpe2QMdH8m\nD0078TU/CqGZfwprutpTNvIxjJAFCIs2Rvn0r3o1EUtbIr/LrXQ4VA4EFz1yrWuZ\nMJwJYUNoO2FTwq7/5ZQcMyQfFKvMvOSqfrOA/rCslxaej6EAv6x9Wi2KGHShR7jY\nhG9Cgw6O0S7WkdrJJ3A8JbRbkA==\n-----END PRIVATE KEY-----\n"
        };
    }

    // 3. Initialize
    try {
        initializeApp({
            credential: cert(serviceAccount),
        });
    } catch (e: any) {
        throw new Error(`Firebase Admin Initialization Failed: ${e.message}`);
    }

    return {
        adminAuth: getAuth(),
        adminDb: getFirestore()
    };
}
