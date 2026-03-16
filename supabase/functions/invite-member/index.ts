// @ts-nocheck
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, name, role, workspaceId, confirmExisting } = await req.json()
    const authHeader = req.headers.get('Authorization')
    
    if (!authHeader) {
      throw new Error('Missing Authorization header')
    }

    // Auth check (Requester)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user: requester }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !requester) {
      console.error('Auth error:', userError)
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    // Admin client for restricted operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Verify requester is admin in this workspace
    const { data: membership, error: membershipError } = await supabaseAdmin
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', requester.id)
      .single()

    if (membershipError || !membership || membership.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Apenas administradores podem convidar novos membros.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      })
    }

    // 1. Check if user already exists globally
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    if (listError) throw listError
    
    const existingUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase())

    if (existingUser) {
      // If we haven't confirmed that we want to invite an existing user yet, 
      // return a signal to the UI to show the confirmation modal.
      if (!confirmExisting) {
        return new Response(JSON.stringify({ 
          needsConfirmation: true,
          message: `O usuário "${email}" já possui conta no SDR Flow. Deseja enviar um convite para ele participar da sua equipe?`,
          userName: existingUser.user_metadata?.full_name || name
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      }

      // Link to workspace as PENDING
      const { error: memberError } = await supabaseAdmin
        .from('workspace_members')
        .insert({
          workspace_id: workspaceId,
          user_id: existingUser.id,
          role: role || 'member',
          status: 'pending'
        })

      if (memberError) {
        if (memberError.code === '23505') {
          return new Response(JSON.stringify({ error: 'Este usuário já faz parte deste workspace.' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          })
        }
        throw memberError
      }

      return new Response(JSON.stringify({ 
        message: 'Convite enviado! O usuário receberá uma notificação para aceitar o acesso à sua equipe.',
        isExisting: true 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // 2. New User - Invite
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email,
      {
        data: { full_name: name },
        redirectTo: `${req.headers.get('origin') || Deno.env.get('PUBLIC_SITE_URL') || 'https://funnel-friend-suite.vercel.app'}/accept-invite`,
      }
    )

    if (inviteError) throw inviteError

    // Add as Workspace Member (PENDING)
    const { error: memberError } = await supabaseAdmin
      .from('workspace_members')
      .insert({
        workspace_id: workspaceId,
        user_id: inviteData.user.id,
        role: role || 'member',
        status: 'pending'
      })

    if (memberError && memberError.code !== '23505') throw memberError

    return new Response(JSON.stringify({ 
      message: 'Convite enviado com sucesso! O novo membro receberá um e-mail para configurar a senha.',
      isExisting: false
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    console.error('Error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
