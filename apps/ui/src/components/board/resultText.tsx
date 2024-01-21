export function ResultText({ result }: { result: number }) {
  return <>{result > 0 ? `+${result}` : result == 0 ? "=" : result}</>;
}
