import React from "react";

const EditM = ({ isEditing, onEdit, onSave, onCancel }) => {
  return (
    <>
      {isEditing ? (
        <>
          <button onClick={onSave} className="btn btn-xs btn-soft btn-success">
            Salvar
          </button>
          <button onClick={onCancel} className="btn btn-xs btn-soft btn-error">
            Cancelar
          </button>
        </>
      ) : (
        <>
          <button onClick={onEdit} className="btn btn-xs btn-soft btn-default">
            Edit
          </button>
        </>
      )}
    </>
  );
};

export default EditM;
