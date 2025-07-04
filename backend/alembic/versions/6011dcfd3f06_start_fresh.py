"""Start fresh

Revision ID: 6011dcfd3f06
Revises: 
Create Date: 2025-06-22 21:29:58.402786

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6011dcfd3f06'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('users',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('username', sa.String(), nullable=False),
    sa.Column('full_name', sa.String(), nullable=False),
    sa.Column('hashed_password', sa.String(), nullable=False),
    sa.Column('role', sa.Enum('manager', 'developer', name='userrole'), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.Column('manager_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['manager_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=True)
    op.create_table('feedback',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('manager_id', sa.Integer(), nullable=False),
    sa.Column('employee_id', sa.Integer(), nullable=False),
    sa.Column('strengths', sa.Text(), nullable=False),
    sa.Column('areas_to_improve', sa.Text(), nullable=False),
    sa.Column('overall_sentiment', sa.Enum('POSITIVE', 'NEUTRAL', 'NEGATIVE', name='feedbacksentiment'), nullable=False),
    sa.Column('rating', sa.Integer(), nullable=False),
    sa.Column('is_acknowledged', sa.Boolean(), nullable=True),
    sa.Column('acknowledged_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    sa.ForeignKeyConstraint(['employee_id'], ['users.id'], ),
    sa.ForeignKeyConstraint(['manager_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_feedback_id'), 'feedback', ['id'], unique=False)
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_feedback_id'), table_name='feedback')
    op.drop_table('feedback')
    op.drop_index(op.f('ix_users_username'), table_name='users')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_table('users')
    # ### end Alembic commands ###
