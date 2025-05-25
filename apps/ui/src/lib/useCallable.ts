import { Functions, httpsCallableFromURL } from "firebase/functions";
import { useCallback, useState } from "react";

export type HttpsCallableHook<
  RequestData = unknown,
  ResponseData = unknown,
> = Readonly<
  [(data: RequestData) => Promise<ResponseData>, boolean, Error | undefined]
>;

export default <RequestData = unknown, ResponseData = unknown>(
  functions: Functions,
  name: string,
): HttpsCallableHook<RequestData, ResponseData> => {
  const [error, setError] = useState<Error>();
  const [loading, setLoading] = useState<boolean>(false);

  const callCallable = useCallback(
    async (data: RequestData): Promise<ResponseData> => {
      const callable = httpsCallableFromURL<RequestData, ResponseData>(
        functions,
        `https://${name}-wrqv6ob42a-uc.a.run.app/${name}`,
      );
      setLoading(true);
      setError(undefined);
      try {
        const response = await callable(data);
        return response.data;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [functions, name],
  );

  return [callCallable, loading, error] as const;
};
