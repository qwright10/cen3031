export type UserCredentials = {
  status: 'notFound',
} | {
  status: 'passwordRequired',
} | {
  status: 'success';
  credentials: PublicKeyCredentialDescriptor[];
};

export async function userCredentials(username: string): Promise<UserCredentials> {
  const response = await  fetch('/api/login', {
    method: 'POST',
    body: JSON.stringify({
      username,
    }),
  });

  if (response.status === 404) {
    return {
      status: 'notFound',
    };
  }

  const credentials: { id: number[]; transports?: AuthenticatorTransport[] }[] = await response.json();

  if (!credentials.length) {
    return {
      status: 'passwordRequired',
    };
  }

  return {
    status: 'success',
    credentials: credentials
      .map(c => ({
        id: new Uint8Array(c.id),
        transports: c.transports,
        type: 'public-key',
      })),
  };
}
