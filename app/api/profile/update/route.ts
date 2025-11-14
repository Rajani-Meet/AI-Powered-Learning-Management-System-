import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, currentPassword, newPassword } = await request.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updateData: any = { name: name.trim() };

    // Handle password change
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required' }, { status: 400 });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValidPassword) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 });
      }

      // Hash new password
      updateData.passwordHash = await bcrypt.hash(newPassword, 12);
    }

    // Update user
    await prisma.user.update({
      where: { id: session.user.id },
      data: updateData
    });

    return NextResponse.json({ success: true, message: 'Profile updated successfully' });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}