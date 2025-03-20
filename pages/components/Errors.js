import { CircleSlashIcon } from "@primer/octicons-react";

const errorMessages = {
  "000SAB": "Sis, Base e Alt Não devem ser 0 todos ao mesmo tempo.",
};

function ErrorComponent({ errorCode }) {
  const errorMessage = errorMessages[errorCode] || "Unknown Error";

  return (
    <div className="toast toast-soft toast-center toast-middle">
      <div className="alert alert-error text-white">
        <CircleSlashIcon size={16} />
        <span>
          Error: {errorCode} - {errorMessage}
        </span>
      </div>
    </div>
  );
}

export default ErrorComponent;
