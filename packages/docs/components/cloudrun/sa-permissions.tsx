import React from "react";

const permissionsJson = require('@remotion/cloudrun/permissions.json');

type Permission = {
  name: string;
  reason: string;
}

export const SAPermissionList: React.FC = () => {
  return (
    <div>
      <pre>{permissionsJson.list.map((permission: Permission) => {
        return `${permission.name}\n`
      })}</pre>
    </div>
  );
};

export const SAPermissionTable: React.FC = () => {
  return (
    <table>
      <tr>
        <th>
          Permission
        </th>
        <th>
          Reason
        </th>
      </tr>
      {permissionsJson.list.map((permission: Permission) => {
        return <tr key={permission.name}>
          <td>
            <code>{permission.name}</code>
          </td>
          <td><code>{permission.reason}</code></td>
        </tr>
      })}
    </table>
  );
};
