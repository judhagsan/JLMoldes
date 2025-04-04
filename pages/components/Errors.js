import React, { useState } from "react";
import { CircleSlashIcon } from "@primer/octicons-react";

const errorMessages = {
  "000BSA": "Base, Sis e Alt Não devem ser 0 todos ao mesmo tempo.",
  R1ID: "Essa Operação ja foi enviada.",
  Nulo: "Nenhuma operação foi efetuada.",
};

function ErrorComponent({ errorCode }) {
  const [showError, setShowError] = useState(false);

  const errorMessage = errorMessages[errorCode] || "Unknown Error";

  const showErrorToast = () => {
    setShowError(true);
    setTimeout(() => {
      setShowError(false);
    }, 3000);
  };

  // Chama a função quando o código de erro é passado
  React.useEffect(() => {
    if (errorCode) {
      showErrorToast();
    }
  }, [errorCode]);

  return (
    <>
      {showError && (
        <div className="toast toast-soft toast-center toast-middle z-30">
          <div className="alert alert-error text-white">
            <CircleSlashIcon size={16} />
            <span>
              Error: {errorCode} - {errorMessage}
            </span>
          </div>
        </div>
      )}
    </>
  );
}

export default ErrorComponent;
