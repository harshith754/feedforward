"""add full_name to users table

Revision ID: add_full_name_to_users
Revises: 6155a5d3ff80
Create Date: 2025-06-22 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'add_full_name_to_users'
down_revision: Union[str, Sequence[str], None] = '6155a5d3ff80'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.add_column('users', sa.Column('full_name', sa.String(), nullable=False, server_default=''))
    op.alter_column('users', 'full_name', server_default=None)

def downgrade() -> None:
    op.drop_column('users', 'full_name')
