const { execSync } = require('child_process');

async function reset() {
  // Tenta carregar bcrypt ou bcryptjs
  let bcrypt;
  try {
    bcrypt = require('bcrypt');
    console.log('✅ Usando biblioteca: bcrypt');
  } catch (e) {
    try {
      bcrypt = require('bcryptjs');
      console.log('✅ Usando biblioteca: bcryptjs');
    } catch (e2) {
      console.error('❌ Nem bcrypt nem bcryptjs estão instalados!');
      console.error('📦 Execute: npm install bcryptjs');
      return;
    }
  }

  console.log('🔄 Gerando hash da senha...');
  const hash = await bcrypt.hash('admin123', 10);
  console.log('✅ Hash gerado');
  
  const sql = `UPDATE users SET password = '${hash}' WHERE email = 'admin@dectra.com';`;
  
  console.log('📡 Atualizando banco...');
  try {
    const result = execSync(
      `docker exec dectracrm-cloud-db-1 psql -U dectra -d dectra_crm -c "${sql}"`,
      { encoding: 'utf-8' }
    );
    console.log('✅ Resultado:', result.trim());
    
    if (result.includes('UPDATE 0')) {
      console.log('\n⚠️ ATENÇÃO: Nenhum usuário foi atualizado!');
      console.log('O e-mail admin@dectra.com não existe no banco.');
      console.log('\n🔍 Verificando usuários existentes...');
      const users = execSync(
        `docker exec dectracrm-cloud-db-1 psql -U dectra -d dectra_crm -c "SELECT email, name, role FROM users LIMIT 10;"`,
        { encoding: 'utf-8' }
      );
      console.log(users);
    } else {
      console.log('\n🎉 SUCESSO!');
      console.log('👤 E-mail: admin@dectra.com');
      console.log('🔑 Senha: admin123');
    }
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

reset();