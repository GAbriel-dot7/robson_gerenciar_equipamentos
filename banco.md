import mysql.connector
from datetime import datetime

class BancoDeDados:
    def __init__(self):
        self.conexao = mysql.connector.connect(
            host='localhost',
            user='root',  
            password=''
        )
        self.cursor = self.conexao.cursor()
        self.inicializar_banco()

    def inicializar_banco(self):
        self.cursor.execute("CREATE DATABASE IF NOT EXISTS manutencao_equipamentos")
        self.cursor.execute("USE manutencao_equipamentos")

        self.cursor.execute("""
        CREATE TABLE IF NOT EXISTS equipamentos (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nome VARCHAR(100),
            tipo VARCHAR(50),
            data_ultima_manutencao DATE,
            prazo_revisao DATE,
            status VARCHAR(20),
            voltagem INT NULL
        )""")

        self.cursor.execute("""
        CREATE TABLE IF NOT EXISTS manutencoes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            equipamento_id INT,
            data DATE,
            detalhes TEXT,
            FOREIGN KEY (equipamento_id) REFERENCES equipamentos(id)
        )""")

    def executar(self, sql, params=None):
        self.cursor.execute(sql, params or ())
        self.conexao.commit()

    def consultar(self, sql, params=None):
        self.cursor.execute(sql, params or ())
        return self.cursor.fetchall()

    def fechar(self):
        self.cursor.close()
        self.conexao.close()


class SistemaManutencao:
    def __init__(self):
        self.db = BancoDeDados()

    def solicitar_data(self, mensagem):
        while True:
            data = input(mensagem)
            try:
                datetime.strptime(data, "%Y-%m-%d")
                return data
            except ValueError:
                print("Data inválida. Use o formato aaaa-mm-dd.")

    def adicionar_equipamento(self):
        nome = input("Nome do equipamento: ")
        tipo = input("Tipo do equipamento: ")
        data_manut = self.solicitar_data("Data da última manutenção (aaaa-mm-dd): ")
        prazo_revisao = self.solicitar_data("Prazo para próxima revisão (aaaa-mm-dd): ")
        status = "disponível"

        voltagem = None
        if tipo.lower() in ['equipamento eletrônico', 'eletronico']:
            voltagem = int(input("Voltagem (110 ou 220): "))

        sql = """
        INSERT INTO equipamentos (nome, tipo, data_ultima_manutencao, prazo_revisao, status, voltagem)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        self.db.executar(sql, (nome, tipo, data_manut, prazo_revisao, status, voltagem))
        print("Equipamento adicionado com sucesso!")

    def listar_equipamentos(self):
        sql = "SELECT * FROM equipamentos"
        equipamentos = self.db.consultar(sql)

        if not equipamentos:
            print("Nenhum equipamento encontrado.")
        else:
            for e in equipamentos:
                print(f"{e[1]} ({e[2]}), Última: {e[3]}, Prazo: {e[4]}, Status: {e[5]}, Voltagem: {e[6]}")

    def remover_equipamento(self):
        nome = input("Digite o nome do equipamento a ser removido: ")
        sql = "DELETE FROM equipamentos WHERE nome = %s"
        self.db.executar(sql, (nome,))
        print(f"Equipamento '{nome}' removido.")

    def registrar_manutencao(self):
        self.listar_equipamentos()
        nome = input("Nome do equipamento a registrar manutenção: ")
        sql = "SELECT id FROM equipamentos WHERE nome = %s"
        result = self.db.consultar(sql, (nome,))
        if not result:
            print("Equipamento não encontrado.")
            return

        equipamento_id = result[0][0]
        data = self.solicitar_data("Data da manutenção (aaaa-mm-dd): ")
        detalhes = input("Detalhes da manutenção: ")

        sql_insert = "INSERT INTO manutencoes (equipamento_id, data, detalhes) VALUES (%s, %s, %s)"
        self.db.executar(sql_insert, (equipamento_id, data, detalhes))

        sql_update = "UPDATE equipamentos SET data_ultima_manutencao = %s WHERE id = %s"
        self.db.executar(sql_update, (data, equipamento_id))
        print("Manutenção registrada com sucesso!")

    def listar_manutencoes(self):
        sql = """
        SELECT e.nome, m.data, m.detalhes
        FROM manutencoes m
        JOIN equipamentos e ON m.equipamento_id = e.id
        """
        manutencoes = self.db.consultar(sql)
        if not manutencoes:
            print("Nenhuma manutenção registrada.")
        else:
            for m in manutencoes:
                print(f"{m[0]} - {m[1]}: {m[2]}")

    def verificar_revisoes_vencidas(self):
        data_atual = self.solicitar_data("Digite a data atual (aaaa-mm-dd): ")
        sql = "SELECT nome, prazo_revisao FROM equipamentos"
        equipamentos = self.db.consultar(sql)

        vencidos = []
        for nome, prazo in equipamentos:
            if prazo and data_atual >= prazo.strftime("%Y-%m-%d"):
                vencidos.append((nome, prazo))

        if vencidos:
            print("Equipamentos com revisão vencida:")
            for nome, prazo in vencidos:
                print(f"- {nome} (prazo: {prazo})")
        else:
            print("Nenhum equipamento com revisão vencida.")


def main():
    sistema = SistemaManutencao()

    while True:
        print("\n--- Sistema de Manutenção ---")
        print("1. Adicionar Equipamento")
        print("2. Remover Equipamento")
        print("3. Listar Equipamentos")
        print("4. Registrar Manutenção")
        print("5. Listar Manutenções")
        print("6. Verificar Revisões Vencidas")
        print("7. Sair")

        opcao = input("Escolha uma opção: ")

        if opcao == '1':
            sistema.adicionar_equipamento()
        elif opcao == '2':
            sistema.remover_equipamento()
        elif opcao == '3':
            sistema.listar_equipamentos()
        elif opcao == '4':
            sistema.registrar_manutencao()
        elif opcao == '5':
            sistema.listar_manutencoes()
        elif opcao == '6':
            sistema.verificar_revisoes_vencidas()
        elif opcao == '7':
            sistema.db.fechar()
            print("Sistema encerrado.")
            break
        else:
            print("Opção inválida. Tente novamente.")


if __name__ == '__main__':
    main()
