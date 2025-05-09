// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.27.0
// source: ratelimit_namespace_find_by_id.sql

package db

import (
	"context"
)

const findRatelimitNamespaceByID = `-- name: FindRatelimitNamespaceByID :one
SELECT id, workspace_id, name, created_at_m, updated_at_m, deleted_at_m FROM ` + "`" + `ratelimit_namespaces` + "`" + `
WHERE id = ?
`

// FindRatelimitNamespaceByID
//
//	SELECT id, workspace_id, name, created_at_m, updated_at_m, deleted_at_m FROM `ratelimit_namespaces`
//	WHERE id = ?
func (q *Queries) FindRatelimitNamespaceByID(ctx context.Context, db DBTX, id string) (RatelimitNamespace, error) {
	row := db.QueryRowContext(ctx, findRatelimitNamespaceByID, id)
	var i RatelimitNamespace
	err := row.Scan(
		&i.ID,
		&i.WorkspaceID,
		&i.Name,
		&i.CreatedAtM,
		&i.UpdatedAtM,
		&i.DeletedAtM,
	)
	return i, err
}
